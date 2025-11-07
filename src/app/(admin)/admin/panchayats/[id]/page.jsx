'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
import { toast } from "react-toastify"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Edit, User, Calendar } from "lucide-react"
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  TextareaAutosize
} from '@mui/material'
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
    religiousPlaces: [],
    waterBodies: [],
    localArt: [],
    localCuisine: [],
    traditions: [],
  })

  const [errors, setErrors] = useState({})
  const [tempInputs, setTempInputs] = useState({
    religiousPlaces: "",
    waterBodies: "",
    localArt: "",
    localCuisine: "",
    traditions: "",
  })

  // FETCH PANCHAYAT
  useEffect(() => {
    if (params.id && !dataLoaded) {
      dispatch(fetchPanchayatById(params.id))
      setDataLoaded(true)
    }
  }, [params.id, dataLoaded, dispatch])

  // POPULATE FORM
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
        religiousPlaces: Array.isArray(selectedPanchayat.religiousPlaces)
          ? selectedPanchayat.religiousPlaces.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
        waterBodies: Array.isArray(selectedPanchayat.waterBodies)
          ? selectedPanchayat.waterBodies.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
        localArt: Array.isArray(selectedPanchayat.localArt)
          ? selectedPanchayat.localArt.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
        localCuisine: Array.isArray(selectedPanchayat.localCuisine)
          ? selectedPanchayat.localCuisine.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
        traditions: Array.isArray(selectedPanchayat.traditions)
          ? selectedPanchayat.traditions.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
      })
    }
  }, [selectedPanchayat, params.id])

  useEffect(() => {
    if (success && isSaving) {
      toast.success("Panchayat updated successfully!")
      dispatch(clearSuccess())
      setIsEditing(false)
      setIsSaving(false)
      // Refresh data
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

  const handleAddItem = (field, value) => {
    if (!value.trim()) return
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }))
    setTempInputs((prev) => ({ ...prev, [field]: "" }))
  }

  const handleRemoveItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
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
        religiousPlaces: Array.isArray(selectedPanchayat.religiousPlaces)
          ? selectedPanchayat.religiousPlaces.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
        waterBodies: Array.isArray(selectedPanchayat.waterBodies)
          ? selectedPanchayat.waterBodies.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
        localArt: Array.isArray(selectedPanchayat.localArt)
          ? selectedPanchayat.localArt.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
        localCuisine: Array.isArray(selectedPanchayat.localCuisine)
          ? selectedPanchayat.localCuisine.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
        traditions: Array.isArray(selectedPanchayat.traditions)
          ? selectedPanchayat.traditions.map((item) => (typeof item === "string" ? item : item?.name || ""))
          : [],
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
        religiousPlaces: formData.religiousPlaces.map((item) => (typeof item === "string" ? { name: item } : item)),
        waterBodies: formData.waterBodies.map((item) => (typeof item === "string" ? { name: item } : item)),
        localCuisine: formData.localCuisine.map((item) => (typeof item === "string" ? { name: item } : item)),
        // localArt and traditions stay as simple strings - NO transformation needed
      }

      const result = await dispatch(updatePanchayat({ id: params.id, panchayatData: formattedData })).unwrap()
      setIsSaving(false)
    } catch (err) {
      console.log("[v0] Error object:", err)
      const errorMessage =
        err?.message || err?.error?.message || (typeof err === "string" ? err : "Failed to update panchayat")

      toast.error(errorMessage)
      setIsSaving(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return { backgroundColor: '#f59e0b', color: 'white' }
      case "pending":
        return { backgroundColor: '#144ae9', color: 'white' }
      case "verified":
        return { backgroundColor: '#10b981', color: 'white' }
      default:
        return { backgroundColor: '#6b7280', color: 'white' }
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
        <Loader />
    )
  }

  if (!selectedPanchayat) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Panchayat not found
        </Typography>
        <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
          <Button sx={{ mt: 2, color: '#144ae9' }}>
            Back to Panchayats
          </Button>
        </Link>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5, borderColor: '#144ae9', color: '#144ae9' }}>
              <ArrowLeft size={20} color="#144ae9" />
            </Button>
          </Link>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {selectedPanchayat.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isEditing ? "Edit panchayat details" : "View panchayat details"}
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
              '&:hover': {
                backgroundColor: '#0d3ec7'
              }
            }}
          >
            Edit
          </Button>
        )}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CREATED BY */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <User size={20} color="#144ae9" />
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Created By
                </Typography>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  {selectedPanchayat.createdBy?.name || "Unknown"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedPanchayat.createdBy?.email || ""}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* STATUS AND DATE */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
                  Status
                </Typography>
                <Chip
                  label={selectedPanchayat.status?.charAt(0).toUpperCase() + selectedPanchayat.status?.slice(1)}
                  sx={getStatusColor(selectedPanchayat.status)}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Calendar size={16} color="#144ae9" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color="text.primary">
                    {formatDate(selectedPanchayat.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* FORM */}
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* BASIC INFO */}
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* NAME */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Panchayat Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={!isEditing}
                  fullWidth
                />
              </Grid>

              {/* SLUG */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Slug *"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  error={!!errors.slug}
                  helperText={errors.slug}
                  disabled={!isEditing}
                  fullWidth
                />
              </Grid>

              {/* BLOCK */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Block"
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                />
              </Grid>

              {/* ESTABLISHMENT YEAR */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Establishment Year"
                  name="establishmentYear"
                  type="number"
                  value={formData.establishmentYear}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                />
              </Grid>

              {/* POPULATION */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Population"
                  name="population"
                  type="number"
                  value={formData.population}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                />
              </Grid>

              {/* STATUS */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Status
                </Typography>
                {isEditing ? (
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#144ae920',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#144ae9',
                      },
                    }}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                  </Select>
                ) : (
                  <Chip
                    label={formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
                    sx={getStatusColor(formData.status)}
                  />
                )}
              </Grid>
            </Grid>
          </Card>

          {/* HISTORICAL BACKGROUND */}
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Historical Background
            </Typography>
            <TextField
              multiline
              rows={4}
              name="historicalBackground"
              value={formData.historicalBackground}
              onChange={handleChange}
              disabled={!isEditing}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#144ae920',
                  },
                  '&:hover fieldset': {
                    borderColor: '#144ae9',
                  },
                },
              }}
            />
          </Card>

          {/* RELIGIOUS PLACES */}
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Religious Places
            </Typography>
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={tempInputs.religiousPlaces}
                  onChange={(e) => setTempInputs({ ...tempInputs, religiousPlaces: e.target.value })}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddItem("religiousPlaces", tempInputs.religiousPlaces))
                  }
                  placeholder="Add religious place"
                  fullWidth
                  size="small"
                />
                <Button
                  type="button"
                  onClick={() => handleAddItem("religiousPlaces", tempInputs.religiousPlaces)}
                  sx={{
                    backgroundColor: '#144ae9',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0d3ec7'
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.religiousPlaces.map((place, index) => (
                <Chip
                  key={index}
                  label={place}
                  onDelete={isEditing ? () => handleRemoveItem("religiousPlaces", index) : undefined}
                  sx={{
                    backgroundColor: '#144ae910',
                    color: '#144ae9',
                    border: '1px solid #144ae920',
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
          </Card>

          {/* WATER BODIES */}
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Water Bodies
            </Typography>
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={tempInputs.waterBodies}
                  onChange={(e) => setTempInputs({ ...tempInputs, waterBodies: e.target.value })}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddItem("waterBodies", tempInputs.waterBodies))
                  }
                  placeholder="Add water body"
                  fullWidth
                  size="small"
                />
                <Button
                  type="button"
                  onClick={() => handleAddItem("waterBodies", tempInputs.waterBodies)}
                  sx={{
                    backgroundColor: '#144ae9',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0d3ec7'
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.waterBodies.map((body, index) => (
                <Chip
                  key={index}
                  label={body}
                  onDelete={isEditing ? () => handleRemoveItem("waterBodies", index) : undefined}
                  sx={{
                    backgroundColor: '#144ae910',
                    color: '#144ae9',
                    border: '1px solid #144ae920',
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
          </Card>

          {/* LOCAL ART */}
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Local Art
            </Typography>
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={tempInputs.localArt}
                  onChange={(e) => setTempInputs({ ...tempInputs, localArt: e.target.value })}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddItem("localArt", tempInputs.localArt))
                  }
                  placeholder="Add art form"
                  fullWidth
                  size="small"
                />
                <Button
                  type="button"
                  onClick={() => handleAddItem("localArt", tempInputs.localArt)}
                  sx={{
                    backgroundColor: '#144ae9',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0d3ec7'
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.localArt.map((art, index) => (
                <Chip
                  key={index}
                  label={art}
                  onDelete={isEditing ? () => handleRemoveItem("localArt", index) : undefined}
                  sx={{
                    backgroundColor: '#144ae910',
                    color: '#144ae9',
                    border: '1px solid #144ae920',
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
          </Card>

          {/* LOCAL CUISINE */}
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Local Cuisine
            </Typography>
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={tempInputs.localCuisine}
                  onChange={(e) => setTempInputs({ ...tempInputs, localCuisine: e.target.value })}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddItem("localCuisine", tempInputs.localCuisine))
                  }
                  placeholder="Add cuisine"
                  fullWidth
                  size="small"
                />
                <Button
                  type="button"
                  onClick={() => handleAddItem("localCuisine", tempInputs.localCuisine)}
                  sx={{
                    backgroundColor: '#144ae9',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0d3ec7'
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.localCuisine.map((cuisine, index) => (
                <Chip
                  key={index}
                  label={cuisine}
                  onDelete={isEditing ? () => handleRemoveItem("localCuisine", index) : undefined}
                  sx={{
                    backgroundColor: '#144ae910',
                    color: '#144ae9',
                    border: '1px solid #144ae920',
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
          </Card>

          {/* TRADITIONS */}
          <Card sx={{ p: 3, border: '1px solid #144ae920' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Traditions
            </Typography>
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={tempInputs.traditions}
                  onChange={(e) => setTempInputs({ ...tempInputs, traditions: e.target.value })}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddItem("traditions", tempInputs.traditions))
                  }
                  placeholder="Add tradition"
                  fullWidth
                  size="small"
                />
                <Button
                  type="button"
                  onClick={() => handleAddItem("traditions", tempInputs.traditions)}
                  sx={{
                    backgroundColor: '#144ae9',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0d3ec7'
                    }
                  }}
                >
                  Add
                </Button>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.traditions.map((tradition, index) => (
                <Chip
                  key={index}
                  label={tradition}
                  onDelete={isEditing ? () => handleRemoveItem("traditions", index) : undefined}
                  sx={{
                    backgroundColor: '#144ae910',
                    color: '#144ae9',
                    border: '1px solid #144ae920',
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
          </Card>

          {/* SUBMIT BUTTONS */}
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                disabled={isSaving || loading}
                startIcon={isSaving || loading ? <Loader /> : <Save size={20} />}
                size="large"
                sx={{
                  backgroundColor: '#144ae9',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#0d3ec7'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#144ae950',
                    color: 'white'
                  }
                }}
              >
                {isSaving || loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isSaving || loading}
                variant="outlined"
                size="large"
                sx={{
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
            </Box>
          )}

          {/* RTC REPORTS LINK */}
          {!isEditing && (
            <Card sx={{ p: 3, border: '1px solid #144ae920', backgroundColor: '#144ae905' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                RTC Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage RTC reports for this panchayat.
              </Typography>
              <Link
                href={`/admin/panchayats/${params.id}/rtc-report`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  sx={{
                    backgroundColor: '#144ae9',
                    color: 'white',
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
        </Box>
      </Box>
    </Box>
  )
}

// "use client"
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchPanchayatById, updatePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { toast } from "react-toastify"
// import { useParams, useRouter } from "next/navigation"
// import Link from "next/link"
// import { ArrowLeft, Save, Loader2, Edit } from "lucide-react"

// export default function PanchayatDetailPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat)

//   const [isEditing, setIsEditing] = useState(false)
//   const [dataLoaded, setDataLoaded] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     block: "",
//     establishmentYear: "",
//     historicalBackground: "",
//     population: "",
//     status: "pending",
//     religiousPlaces: [],
//     waterBodies: [],
//     localArt: [],
//     localCuisine: [],
//     traditions: [],
//   })

//   const [errors, setErrors] = useState({})
//   const [tempInputs, setTempInputs] = useState({
//     religiousPlaces: "",
//     waterBodies: "",
//     localArt: "",
//     localCuisine: "",
//     traditions: "",
//   })

//   // FETCH PANCHAYAT
//   useEffect(() => {
//     if (params.id && !dataLoaded) {
//       dispatch(fetchPanchayatById(params.id))
//       setDataLoaded(true)
//     }
//   }, [params.id, dataLoaded])

//   // POPULATE FORM
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
//         religiousPlaces: Array.isArray(selectedPanchayat.religiousPlaces)
//           ? selectedPanchayat.religiousPlaces.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//         waterBodies: Array.isArray(selectedPanchayat.waterBodies)
//           ? selectedPanchayat.waterBodies.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//         localArt: Array.isArray(selectedPanchayat.localArt)
//           ? selectedPanchayat.localArt.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//         localCuisine: Array.isArray(selectedPanchayat.localCuisine)
//           ? selectedPanchayat.localCuisine.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//         traditions: Array.isArray(selectedPanchayat.traditions)
//           ? selectedPanchayat.traditions.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//       })
//     }
//   }, [selectedPanchayat, params.id])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("Panchayat updated successfully!")
//       dispatch(clearSuccess())
//       setIsEditing(false)
//       dispatch(fetchPanchayatById(params.id))
//     }
//     if (error) {
//       toast.error(error.message || "Something went wrong")
//       dispatch(clearError())
//     }
//   }, [success, error])

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

//   const handleAddItem = (field, value) => {
//     if (!value.trim()) return
//     setFormData((prev) => ({
//       ...prev,
//       [field]: [...prev[field], value.trim()],
//     }))
//     setTempInputs((prev) => ({ ...prev, [field]: "" }))
//   }

//   const handleRemoveItem = (field, index) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: prev[field].filter((_, i) => i !== index),
//     }))
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
//         religiousPlaces: Array.isArray(selectedPanchayat.religiousPlaces)
//           ? selectedPanchayat.religiousPlaces.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//         waterBodies: Array.isArray(selectedPanchayat.waterBodies)
//           ? selectedPanchayat.waterBodies.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//         localArt: Array.isArray(selectedPanchayat.localArt)
//           ? selectedPanchayat.localArt.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//         localCuisine: Array.isArray(selectedPanchayat.localCuisine)
//           ? selectedPanchayat.localCuisine.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
//         traditions: Array.isArray(selectedPanchayat.traditions)
//           ? selectedPanchayat.traditions.map((item) => (typeof item === "string" ? item : item?.name || ""))
//           : [],
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
//       await dispatch(updatePanchayat({ id: params.id, panchayatData: formData })).unwrap()
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "draft":
//         return "bg-yellow-100 text-yellow-800"
//       case "pending":
//         return "bg-blue-100 text-blue-800"
//       case "verified":
//         return "bg-green-100 text-green-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   if (loading && !selectedPanchayat) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader2 className="h-8 w-8 animate-spin text-green-600" />
//       </div>
//     )
//   }

//   if (!selectedPanchayat) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-500">Panchayat not found</p>
//         <Link href="/admin/panchayats" className="mt-4 inline-block text-green-600 hover:text-green-700">
//           Back to Panchayats
//         </Link>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
//           <Link href="/admin/panchayats" className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
//             <ArrowLeft className="h-6 w-6 text-gray-600" />
//           </Link>
//           <div className="min-w-0 flex-1">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{selectedPanchayat.name}</h1>
//             <p className="text-sm sm:text-base text-gray-600 mt-1">
//               {isEditing ? "Edit panchayat details" : "View panchayat details"}
//             </p>
//           </div>
//         </div>
//         {!isEditing && (
//           <button
//             onClick={() => setIsEditing(true)}
//             className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
//           >
//             <Edit className="h-5 w-5" />
//             <span className="text-sm sm:text-base">Edit</span>
//           </button>
//         )}
//       </div>

//       {/* STATUS BADGE */}
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium text-gray-600">Status:</span>
//           <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPanchayat.status)}`}>
//             {selectedPanchayat.status?.charAt(0).toUpperCase() + selectedPanchayat.status?.slice(1)}
//           </span>
//         </div>
//       </div>

//       {/* FORM */}
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* BASIC INFO */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* NAME */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Panchayat Name *</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-sm ${
//                   errors.name ? "border-red-500" : "border-gray-300"
//                 }`}
//               />
//               {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//             </div>

//             {/* SLUG */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
//               <input
//                 type="text"
//                 name="slug"
//                 value={formData.slug}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-sm ${
//                   errors.slug ? "border-red-500" : "border-gray-300"
//                 }`}
//               />
//               {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
//             </div>

//             {/* BLOCK */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
//               <input
//                 type="text"
//                 name="block"
//                 value={formData.block}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-sm"
//               />
//             </div>

//             {/* ESTABLISHMENT YEAR */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Establishment Year</label>
//               <input
//                 type="number"
//                 name="establishmentYear"
//                 value={formData.establishmentYear}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-sm"
//               />
//             </div>

//             {/* POPULATION */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Population</label>
//               <input
//                 type="number"
//                 name="population"
//                 value={formData.population}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-sm"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//               {isEditing ? (
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
//                 >
//                   <option value="draft">Draft</option>
//                   <option value="pending">Pending</option>
//                   <option value="verified">Verified</option>
//                 </select>
//               ) : (
//                 <div className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(formData.status)}`}>
//                   {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* HISTORICAL BACKGROUND */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Historical Background</h2>
//           <textarea
//             name="historicalBackground"
//             value={formData.historicalBackground}
//             onChange={handleChange}
//             disabled={!isEditing}
//             rows={4}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 text-sm"
//           />
//         </div>

//         {/* RELIGIOUS PLACES */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Religious Places</h2>
//           {isEditing && (
//             <div className="flex flex-col sm:flex-row gap-2 mb-3">
//               <input
//                 type="text"
//                 value={tempInputs.religiousPlaces}
//                 onChange={(e) => setTempInputs({ ...tempInputs, religiousPlaces: e.target.value })}
//                 onKeyDown={(e) =>
//                   e.key === "Enter" &&
//                   (e.preventDefault(), handleAddItem("religiousPlaces", tempInputs.religiousPlaces))
//                 }
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
//                 placeholder="Add religious place"
//               />
//               <button
//                 type="button"
//                 onClick={() => handleAddItem("religiousPlaces", tempInputs.religiousPlaces)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
//               >
//                 Add
//               </button>
//             </div>
//           )}
//           <div className="flex flex-wrap gap-2">
//             {formData.religiousPlaces.map((place, index) => (
//               <span
//                 key={index}
//                 className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
//               >
//                 {place}
//                 {isEditing && (
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveItem("religiousPlaces", index)}
//                     className="hover:text-blue-900"
//                   >
//                     ×
//                   </button>
//                 )}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* WATER BODIES */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Water Bodies</h2>
//           {isEditing && (
//             <div className="flex flex-col sm:flex-row gap-2 mb-3">
//               <input
//                 type="text"
//                 value={tempInputs.waterBodies}
//                 onChange={(e) => setTempInputs({ ...tempInputs, waterBodies: e.target.value })}
//                 onKeyDown={(e) =>
//                   e.key === "Enter" && (e.preventDefault(), handleAddItem("waterBodies", tempInputs.waterBodies))
//                 }
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
//                 placeholder="Add water body"
//               />
//               <button
//                 type="button"
//                 onClick={() => handleAddItem("waterBodies", tempInputs.waterBodies)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
//               >
//                 Add
//               </button>
//             </div>
//           )}
//           <div className="flex flex-wrap gap-2">
//             {formData.waterBodies.map((body, index) => (
//               <span
//                 key={index}
//                 className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm"
//               >
//                 {body}
//                 {isEditing && (
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveItem("waterBodies", index)}
//                     className="hover:text-cyan-900"
//                   >
//                     ×
//                   </button>
//                 )}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* LOCAL ART */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Art</h2>
//           {isEditing && (
//             <div className="flex flex-col sm:flex-row gap-2 mb-3">
//               <input
//                 type="text"
//                 value={tempInputs.localArt}
//                 onChange={(e) => setTempInputs({ ...tempInputs, localArt: e.target.value })}
//                 onKeyDown={(e) =>
//                   e.key === "Enter" && (e.preventDefault(), handleAddItem("localArt", tempInputs.localArt))
//                 }
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
//                 placeholder="Add art form"
//               />
//               <button
//                 type="button"
//                 onClick={() => handleAddItem("localArt", tempInputs.localArt)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
//               >
//                 Add
//               </button>
//             </div>
//           )}
//           <div className="flex flex-wrap gap-2">
//             {formData.localArt.map((art, index) => (
//               <span
//                 key={index}
//                 className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
//               >
//                 {art}
//                 {isEditing && (
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveItem("localArt", index)}
//                     className="hover:text-pink-900"
//                   >
//                     ×
//                   </button>
//                 )}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* LOCAL CUISINE */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Local Cuisine</h2>
//           {isEditing && (
//             <div className="flex flex-col sm:flex-row gap-2 mb-3">
//               <input
//                 type="text"
//                 value={tempInputs.localCuisine}
//                 onChange={(e) => setTempInputs({ ...tempInputs, localCuisine: e.target.value })}
//                 onKeyDown={(e) =>
//                   e.key === "Enter" && (e.preventDefault(), handleAddItem("localCuisine", tempInputs.localCuisine))
//                 }
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
//                 placeholder="Add cuisine"
//               />
//               <button
//                 type="button"
//                 onClick={() => handleAddItem("localCuisine", tempInputs.localCuisine)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
//               >
//                 Add
//               </button>
//             </div>
//           )}
//           <div className="flex flex-wrap gap-2">
//             {formData.localCuisine.map((cuisine, index) => (
//               <span
//                 key={index}
//                 className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
//               >
//                 {cuisine}
//                 {isEditing && (
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveItem("localCuisine", index)}
//                     className="hover:text-orange-900"
//                   >
//                     ×
//                   </button>
//                 )}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* TRADITIONS */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Traditions</h2>
//           {isEditing && (
//             <div className="flex flex-col sm:flex-row gap-2 mb-3">
//               <input
//                 type="text"
//                 value={tempInputs.traditions}
//                 onChange={(e) => setTempInputs({ ...tempInputs, traditions: e.target.value })}
//                 onKeyDown={(e) =>
//                   e.key === "Enter" && (e.preventDefault(), handleAddItem("traditions", tempInputs.traditions))
//                 }
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
//                 placeholder="Add tradition"
//               />
//               <button
//                 type="button"
//                 onClick={() => handleAddItem("traditions", tempInputs.traditions)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm whitespace-nowrap"
//               >
//                 Add
//               </button>
//             </div>
//           )}
//           <div className="flex flex-wrap gap-2">
//             {formData.traditions.map((tradition, index) => (
//               <span
//                 key={index}
//                 className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
//               >
//                 {tradition}
//                 {isEditing && (
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveItem("traditions", index)}
//                     className="hover:text-purple-900"
//                   >
//                     ×
//                   </button>
//                 )}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* SUBMIT BUTTONS */}
//         {isEditing && (
//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                   <span>Updating...</span>
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-5 w-5" />
//                   <span>Save Changes</span>
//                 </>
//               )}
//             </button>
//             <button
//               type="button"
//               onClick={handleCancel}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
//             >
//               Cancel
//             </button>
//           </div>
//         )}

//         {/* RTC REPORTS LINK */}
//         {!isEditing && (
//           <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">RTC Reports</h2>
//             <p className="text-gray-600 text-sm mb-4">View and manage RTC reports for this panchayat.</p>
//             <Link
//               href={`/admin/panchayats/${params.id}/rtc-reports`}
//               className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
//             >
//               View RTC Reports
//             </Link>
//           </div>
//         )}
//       </form>
//     </div>
//   )
// }
